"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageIcon, Upload, Trash2 } from "lucide-react"

interface BannerImageUploadProps {
  currentImage: string | null
  onImageChange: (image: string | null) => void
}

// Sample banner images
const defaultBanners = [
  {
    id: "abstract1",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80",
  },
  { id: "abstract2", url: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=800&auto=format&fit=crop&q=80" },
  { id: "abstract3", url: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=800&auto=format&fit=crop&q=80" },
  {
    id: "abstract4",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "nature1",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "nature2",
    url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "nature3",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "nature4",
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80",
  },
]

export function BannerImageUpload({ currentImage, onImageChange }: BannerImageUploadProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [imageUrl, setImageUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        onImageChange(event.target.result as string)
        setOpen(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (imageUrl) {
      onImageChange(imageUrl)
      setOpen(false)
      setImageUrl("")
    }
  }

  const handleSelectDefaultBanner = (url: string) => {
    onImageChange(url)
    setOpen(false)
  }

  const handleRemoveBanner = () => {
    onImageChange(null)
  }

  return (
    <div className="space-y-4">
      {currentImage ? (
        <div className="relative">
          <img src={currentImage || "/placeholder.svg"} alt="Banner" className="w-full h-48 object-cover rounded-md" />
          <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={handleRemoveBanner}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-48 flex flex-col items-center justify-center gap-2 border-dashed"
            >
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <span>Add Banner Image</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Banner Image</DialogTitle>
            </DialogHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="url">URL</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="py-4">
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Drag and drop an image, or click to browse</p>
                      <Button variant="secondary" size="sm" className="mt-2">
                        Select File
                      </Button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Recommended size: 1200 x 300 pixels. Max file size: 5MB.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="url" className="py-4">
                <form onSubmit={handleUrlSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image-url">Image URL</Label>
                    <Input
                      id="image-url"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={!imageUrl}>
                    Add Image
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="gallery" className="py-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {defaultBanners.map((banner) => (
                    <div
                      key={banner.id}
                      className="relative aspect-[3/1] rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handleSelectDefaultBanner(banner.url)}
                    >
                      <img
                        src={banner.url || "/placeholder.svg"}
                        alt={`Banner ${banner.id}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
