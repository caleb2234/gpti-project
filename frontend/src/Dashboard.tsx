import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getImages } from "@/api/generated";
import { postUpload } from "@/api/generated";
import { useNavigate } from "react-router-dom";
import { trpc } from './main';
import { toast } from "sonner"


export default function Dashboard() {
  const [file, setFile] = useState<File |null>(null);
  const [uploadedImages, setUploadedImages] = useState<{name: string, status: string}[]>([]);
  const [imageGallery, setImageGallery] = useState<{name: string, publicUrl: string}[]>([]);
  const { data: user, isLoading: userLoading } = trpc.getUserProfile.useQuery();
  const navigate = useNavigate();

  const handleUpload = async () => {  
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
    const { data } = await postUpload({
      body: formData,
      credentials: "include",
    });

      setUploadedImages((prev) => [
        ...prev,
        {name: data.filename, status: data.status},
      ]);
      setFile(null);
    } catch (err) {
      toast.error("Upload failed. Please try again.");
    }
  };
  useEffect(() => {
    if (!userLoading && !user) {
      navigate("/");
      }
    else if (!userLoading && user) {
      toast.success(`Welcome, ${user.name}`);
    }
    }, [user, userLoading]);
  useEffect(() => {

    const fetchImages = async () => {
      const { data } = await getImages({
        credentials: "include",
      });
    setImageGallery(data.images.reverse());
    };
    fetchImages();
    const socket = new WebSocket('wss://barely-diverse-pika.ngrok-free.app/ws') //or whatever you use to expose the backend
    socket.onmessage = (event) => {
      const { filename, status } = JSON.parse(event.data)
      console.log('📬 WS message received:', { filename, status });
      setUploadedImages((prev) =>
        prev.map((img) => 
          img.name === filename ? { ...img, status } : img
        )
      )

      if (status === 'Processed') {
        toast.success(`${filename} successfully processed`);
        fetchImages();
      }
    };
    return () => socket.close();
  }, [user]);
  if (userLoading) {
    return <div className="p-8">Loading...</div>
  }
  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {!userLoading && user && (
        <div className="text-sm text-muted-foreground">
          Logged in as: <span className="font-medium">{user.name}</span> ({user.email})
        </div>
      )}
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