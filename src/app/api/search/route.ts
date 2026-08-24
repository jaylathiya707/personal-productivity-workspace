import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''

    if (!query.trim()) {
      return NextResponse.json({ tasks: [], todos: [], notes: [], improveItems: [] })
    }

    const q = query.trim()

    const [tasks, todos, notes, improveItems] = await Promise.all([
      prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { category: { contains: q } },
          ],
        },
        take: 5,
      }),
      prisma.todo.findMany({
        where: {
          title: { contains: q },
        },
        take: 5,
      }),
      prisma.note.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { content: { contains: q } },
          ],
        },
        take: 5,
      }),
      prisma.improveItem.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        },
        take: 5,
      }),
    ])

    return NextResponse.json({ tasks, todos, notes, improveItems })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
