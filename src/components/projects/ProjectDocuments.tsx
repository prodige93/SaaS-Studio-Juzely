import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Trash2, Download, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

interface ProjectDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

interface ProjectDocumentsProps {
  projectId: string;
}

export function ProjectDocuments({ projectId }: ProjectDocumentsProps) {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  // Load documents
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("project_attachments")
        .select("*")
        .eq("project_id", projectId)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast.error("Erreur lors du chargement des documents");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Upload document
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);

      // Upload to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${projectId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("project-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await supabase
        .from("project_attachments")
        .insert({
          project_id: projectId,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.id,
        });

      if (dbError) throw dbError;

      toast.success("Document ajouté avec succès");
      loadDocuments();
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error("Erreur lors de l'ajout du document");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  // Download document
  const handleDownload = async (doc: ProjectDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from("project-documents")
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Erreur lors du téléchargement");
    }
  };

  // Delete document
  const handleDelete = async (doc: ProjectDocument) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("project-documents")
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("project_attachments")
        .delete()
        .eq("id", doc.id);

      if (dbError) throw dbError;

      toast.success("Document supprimé");
      loadDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Documents PDF</h3>
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Upload en cours..." : "Ajouter"}
          </Button>
        )}
        <input
          id="file-upload"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Chargement...
        </div>
      ) : documents.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Aucun document PDF ajouté</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.file_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(doc.file_size)} •{" "}
                      {new Date(doc.uploaded_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(doc)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
