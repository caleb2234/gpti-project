import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export default function Dashboard() {
  const [file, setFile] = useState<File |null>(null);
  const [uploadedImages, setUploadedImages] = useState<{name: string, status: string}[]>([]);
  const [imageGallery, setImageGallery] = useState<{name: string, publicUrl: string}[]>([]);
  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Upload failed");
      }
      const data = await res.json();
      setUploadedImages((prev) => [
        ...prev,
        {name: data.filename, status: data.status},
      ]);
      setFile(null);
    } catch (err) {
      alert("Upload failed");
    }
  };
  useEffect(() => {
    const fetchImages = async () => {
      const res = await fetch("http://localhost:3001/images", {
        credentials: "include",
      });
      const data = await res.json();
      setImageGallery(data.images.reverse());
    };
    fetchImages();
    const socket = new WebSocket('ws://localhost:3001/ws')
    socket.onmessage = (event) => {
      const { filename, status } = JSON.parse(event.data)

      setUploadedImages((prev) =>
        prev.map((img) => 
          img.name === filename ? { ...img, status } : img
        )
      )

      if (status === 'Processed') {
        fetchImages();
      }
    };
    return () => socket.close();
  }, []);
  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <Input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <Button onClick={handleUpload} disabled={!file}>
        Upload Image
      </Button>

      <div className="space-y-4">
        {uploadedImages.map((img, idx) => (
          <div key={idx} className="border p-3 rounded shadow">
            <div className="font-medium">{img.name}</div>
            <div className="text-sm text-muted-foreground">
              {img.status === "Uploaded to GCS" && "Processing..."}
              {img.status === "Processed" && <span className="text-green-600">✅ Processed</span>}
            </div>
          </div>
        ))}
      </div>
      <hr className="my-6" />

      <h2 className="text-xl font-semibold">Uploaded Images</h2>
      <div className="grid grid-cols-2 gap-4">
        {imageGallery.map((img) => (
          <div key={img.name} className="rounded shadow p-2 bg-white">
            <img
              src={img.publicUrl}
              alt={img.name}
              className="w-full h-auto object-cover"
            />
            <p className="text-sm mt-1">{img.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}