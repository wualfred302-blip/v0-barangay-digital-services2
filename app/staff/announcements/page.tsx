"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useAnnouncements, type AnnouncementCategory, type AnnouncementPriority } from "@/lib/announcements-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Plus, Megaphone, Pin, Trash2, Eye, EyeOff } from "lucide-react"

export default function StaffAnnouncementsPage() {
  const router = useRouter()
  const { staffUser, isStaffAuthenticated } = useAuth()
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general" as AnnouncementCategory,
    priority: "normal" as AnnouncementPriority,
    isPinned: false,
  })

  if (!isStaffAuthenticated) {
    router.push("/staff/login")
    return null
  }

  const canPublish = staffUser?.role === "captain" || staffUser?.role === "secretary"

  const handleCreate = () => {
    const newAnnouncement = addAnnouncement({
      ...formData,
      isPublished: false,
      authorId: staffUser?.id,
      authorName: staffUser?.fullName,
    })
    setFormData({ title: "", content: "", category: "general", priority: "normal", isPinned: false })
    setIsCreateOpen(false)
  }

  const handlePublish = (id: string) => {
    updateAnnouncement(id, {
      isPublished: true,
      publishedAt: new Date().toISOString(),
      approvedBy: staffUser?.id,
    })
  }

  const handleUnpublish = (id: string) => {
    updateAnnouncement(id, { isPublished: false })
  }

  const handleTogglePin = (id: string, currentPinned: boolean) => {
    updateAnnouncement(id, { isPinned: !currentPinned })
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      deleteAnnouncement(id)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href={`/staff/${staffUser?.role}`} className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-blue-500" />
              <h1 className="text-lg font-semibold text-slate-900">Announcements</h1>
            </div>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="mr-1 h-4 w-4" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Announcement title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your announcement here..."
                    rows={5}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v as AnnouncementCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="notice">Notice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(v) => setFormData({ ...formData, priority: v as AnnouncementPriority })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Pin Announcement</p>
                    <p className="text-sm text-slate-500">Show at top of list</p>
                  </div>
                  <Switch
                    checked={formData.isPinned}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPinned: checked })}
                  />
                </div>
                <Button onClick={handleCreate} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Create Draft
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-5 py-6">
        {/* Stats */}
        <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
          <Card className="min-w-[120px] flex-shrink-0 border-0 bg-emerald-50">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-emerald-900">{announcements.filter((a) => a.isPublished).length}</p>
              <p className="text-xs text-emerald-700">Published</p>
            </CardContent>
          </Card>
          <Card className="min-w-[120px] flex-shrink-0 border-0 bg-amber-50">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-amber-900">{announcements.filter((a) => !a.isPublished).length}</p>
              <p className="text-xs text-amber-700">Drafts</p>
            </CardContent>
          </Card>
          <Card className="min-w-[120px] flex-shrink-0 border-0 bg-blue-50">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-blue-900">{announcements.filter((a) => a.isPinned).length}</p>
              <p className="text-xs text-blue-700">Pinned</p>
            </CardContent>
          </Card>
        </div>

        {/* Announcement List */}
        <div className="space-y-3">
          {announcements.map((ann) => (
            <Card key={ann.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{ann.title}</p>
                      {ann.isPinned && (
                        <span className="flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                          <Pin className="h-3 w-3" />
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          ann.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ann.isPublished ? "Published" : "Draft"}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                          ann.priority === "urgent"
                            ? "bg-red-100 text-red-700"
                            : ann.priority === "high"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ann.priority}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{ann.content}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                      <span className="capitalize">{ann.category}</span>
                      <span>
                        {new Date(ann.createdAt).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {canPublish && !ann.isPublished && (
                    <Button
                      size="sm"
                      onClick={() => handlePublish(ann.id)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Publish
                    </Button>
                  )}
                  {ann.isPublished && (
                    <Button size="sm" variant="outline" onClick={() => handleUnpublish(ann.id)}>
                      <EyeOff className="mr-1 h-3 w-3" />
                      Unpublish
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleTogglePin(ann.id, ann.isPinned)}>
                    <Pin className="mr-1 h-3 w-3" />
                    {ann.isPinned ? "Unpin" : "Pin"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 bg-transparent"
                    onClick={() => handleDelete(ann.id)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {announcements.length === 0 && (
            <div className="py-12 text-center">
              <Megaphone className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No announcements yet</p>
              <Button onClick={() => setIsCreateOpen(true)} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                Create First Announcement
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
