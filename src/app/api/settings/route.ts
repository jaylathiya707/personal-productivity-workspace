import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    let setting = await prisma.userSetting.findUnique({
      where: { id: 'user_setting' },
    })

    if (!setting) {
      setting = await prisma.userSetting.create({
        data: {
          id: 'user_setting',
          userName: 'Student',
          theme: 'dark',
        },
      })
    }

    return NextResponse.json(setting)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { userName, theme } = body

    const updated = await prisma.userSetting.upsert({
      where: { id: 'user_setting' },
      update: {
        ...(userName !== undefined && { userName }),
        ...(theme !== undefined && { theme }),
      },
      create: {
        id: 'user_setting',
        userName: userName || 'Student',
        theme: theme || 'dark',
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    if (action === 'clear_completed') {
      await Promise.all([
        prisma.task.deleteMany({ where: { status: 'COMPLETED' } }),
        prisma.todo.deleteMany({ where: { completed: true } }),
      ])
      return NextResponse.json({ message: 'Completed items cleared successfully' })
    }

    if (action === 'delete_all') {
      await Promise.all([
        prisma.task.deleteMany({}),
        prisma.todo.deleteMany({}),
        prisma.note.deleteMany({}),
        prisma.improveItem.deleteMany({}),
      ])
      return NextResponse.json({ message: 'All data deleted successfully' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in settings delete action:', error)
    return NextResponse.json({ error: 'Action failed' }, { status: 500 })
  }
}
