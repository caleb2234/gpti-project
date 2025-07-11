import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getImages } from "@/api/generated";
import { postUpload } from "@/api/generated";
import { useNavigate } from "react-router-dom";
import { trpc } from './main';
import { toast } from "sonner"


export default function Dashboard() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<{name: string, status: string}[]>([]);
  const [imageGallery, setImageGallery] = useState<{name: string, publicUrl: string}[]>([]);
  const { data: user, isLoading: userLoading } = trpc.getUserProfile.useQuery();
  const { error } = trpc.getUserProfile.useQuery();
  const navigate = useNavigate();

  const handleUpload = async () => {  
  for (const file of files) {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data } = await postUpload({
        body: formData,
        credentials: "include",
      });

      setUploadedImages((prev) => [
        { name: data.filename, status: data.status },
        ...prev,
      ]);
    } catch (err) {
      toast.error(`Upload failed: ${file.name}`);
    }
  }

  setFiles([]);
  };
  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch user profile");
      navigate("/");
    }
  }, [error]);
  useEffect(() => {
    if (!userLoading && !user) {
      navigate("/");
      }
    else if (!userLoading && user) {
      toast.success(`Welcome, ${user.name}`);
    }
    }, [user, userLoading]);
  useEffect(() => {
    
    //get images from bucket
    const fetchImages = async () => {
      try {
        const { data } = await getImages({
          credentials: "include",
        });
        setImageGallery(data.images.reverse());
      } catch (err) {
        toast.error("Failed to load images");
      }
    };
    fetchImages();

    //websocket
    const socket = new WebSocket('wss://barely-diverse-pika.ngrok-free.app/ws') //or whatever you use to expose the backend
    socket.onmessage = (event) => {
      try {const { filename, status } = JSON.parse(event.data)
      console.log('📬 WS message received:', { filename, status });
      setUploadedImages((prev) =>
        prev.map((img) => 
          img.name === filename ? { ...img, status } : img
        )
      )

      if (status === 'Processed') {
        toast.success(`${filename} successfully processed`);
        fetchImages();
      }} catch (err) {
        toast.error("Websocket error");
        console.log("Websocket error:", event.data)
      }
    };
    socket.onerror = () => toast.error("WebSocket connection error");
    return () => socket.close();
  }, [user, userLoading]);
  if (userLoading) {
    return <div className="p-8">Loading...</div>
  }
  return (
<div className="w-full min-h-screen p-4">
  <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-2 bg-white rounded-xl shadow mb-6">
    <div className="text-sm text-muted-foreground">
      {!userLoading && user && (
        <>
          Logged in as: <span className="font-medium">{user.name}</span> ({user.email})
        </>
      )}
    </div>
    <Button
      variant="outline"
      onClick={async () => {
        await fetch("http://localhost:3001/auth/logout", {
          credentials: "include",
        });
        navigate("/");
        toast.success("Signed out");
      }}
    >
      Logout
    </Button>
  </div>

  <div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w mx-auto">
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-xl font-bold">Upload Image</h1>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              setFiles(files);}}
            className="flex-1"
          />
          <Button onClick={handleUpload} disabled={files.length == 0}>
            Upload {files.length > 1 ? `${files.length} Images` : 'Image'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold">Processing Status</h2>
        {uploadedImages.length === 0 && (
          <p className="text-muted-foreground text-sm">No uploads yet.</p>
        )}
        {uploadedImages.map((img, idx) => (
          <div key={idx} className="border p-3 rounded bg-muted/50">
            <div className="font-medium">{img.name}</div>
            <div className="text-sm text-muted-foreground">
              {img.status === "Uploaded to GCS" && "Processing..."}
              {img.status === "Processed" && (
                <span className="text-green-600">✅ Processed</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-white rounded-xl shadow p-6 h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Image Gallery</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {imageGallery.map((img) => (
          <div key={img.name} className="rounded shadow p-2 bg-white">
            <img
              src={img.publicUrl}
              alt={img.name}
              className="w-full h-48 object-cover rounded"
            />
            <p className="text-sm mt-2 text-center">{img.name}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
</div>

  );
}