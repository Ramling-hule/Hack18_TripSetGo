// src/langgraph/checkpointer.js
// ─────────────────────────────────────────────────────────────────────────────
// Phase 4 — MongoDB Checkpointing for LangGraph
//
// Connects the MongoDBSaver to the EXISTING Mongoose connection so no second
// MongoClient is opened.  The checkpointer gives LangGraph automatic
// multi-turn memory:  state is written to MongoDB after every node execution
// and reloaded at the start of each `graph.invoke` / `graph.streamEvents`
// call by matching the `thread_id` in the RunnableConfig.
//
// Usage:
//   const { getCheckpointer } = require('./langgraph/checkpointer')
//   const checkpointer = await getCheckpointer()
//   const graph = workflow.compile({ checkpointer })
//   await graph.invoke(state, { configurable: { thread_id: 'conv_<conversationId>' } })
//
// Dependency (add once):
//   npm install @langchain/langgraph-checkpoint-mongodb
// ─────────────────────────────────────────────────────────────────────────────

'use strict'

const mongoose = require('mongoose')
const { MongoDBSaver } = require('@langchain/langgraph-checkpoint-mongodb')
const logger = require('../utils/logger')

/** @type {import('@langchain/langgraph-checkpoint-mongodb').MongoDBSaver | null} */
let _checkpointer = null

/**
 * Returns (and lazily initialises) a MongoDBSaver that shares the live
 * Mongoose connection.
 *
 * ⚠️  Call this AFTER `connectDB()` has resolved — i.e. inside an async
 * startup block or the first time a request arrives.
 *
 * The returned saver is a singleton: every call after the first returns the
 * same instance so we don't keep opening duplicate database handles.
 *
 * @returns {Promise<import('@langchain/langgraph-checkpoint-mongodb').MongoDBSaver>}
 */
async function getCheckpointer() {
  if (_checkpointer) return _checkpointer

  const { connection } = mongoose

  if (connection.readyState !== 1 /* connected */) {
    throw new Error(
      '[Checkpointer] Mongoose is not connected. ' +
      'Ensure connectDB() has finished before calling getCheckpointer().'
    )
  }

  // MongoDBSaver accepts an already-open MongoClient via `connection.getClient()`
  // so it reuses the connection pool Mongoose manages.
  const client = connection.getClient()

  _checkpointer = new MongoDBSaver({
    client,
    // Store checkpoints in the same DB Mongoose is using.
    dbName: connection.db.databaseName,
    // Dedicated collection — won't interfere with app collections.
    checkpointCollectionName: 'lg_checkpoints',
    writeCollectionName:      'lg_checkpoint_writes',
  })

  logger.info(
    `[Checkpointer] MongoDBSaver ready — db: "${connection.db.databaseName}", ` +
    `collections: lg_checkpoints / lg_checkpoint_writes`
  )

  return _checkpointer
}

/**
 * Resets the singleton — useful in tests that need a clean state.
 */
function resetCheckpointer() {
  _checkpointer = null
}

module.exports = { getCheckpointer, resetCheckpointer }
