import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export default function Dashboard() {
  const [file, setFile] = useState<File |null>(null);
  const [uploadedImages, setUploadedImages] = useState<{name: string, status: string}[]>([]);
  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      setUploadedImages((prev) => [
        ...prev,
        {name: file.name, status: "Uploaded"},
      ]);
    } catch (err) {
      alert("Upload failed");
    }
  };
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
            <div className="text-sm text-muted-foreground">{img.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}