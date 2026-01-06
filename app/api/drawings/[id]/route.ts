import { NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = "drawboard"

async function getDatabase() {
  const client = new MongoClient(uri)
  await client.connect()
  return { client, db: client.db(dbName) }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let client: MongoClient | null = null

  try {
    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const { client: dbClient, db } = await getDatabase()
    client = dbClient

    const result = await db.collection("drawings").deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Drawing not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting drawing:", error)
    return NextResponse.json({ error: "Failed to delete drawing" }, { status: 500 })
  } finally {
    if (client) {
      await client.close()
    }
  }
}
