import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2,
  FileText
} from 'lucide-react';
import { adminContentApi } from '@/lib/admin-api';
import { Content } from '@shared/api';
import { ContentDialog } from '@/components/admin/ContentDialog';

export default function AdminContent() {
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: contentData, isLoading } = useQuery({
    queryKey: ['admin-content'],
    queryFn: () => adminContentApi.getAll()
  });

  const deleteContent = useMutation({
    mutationFn: adminContentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content'] });
    }
  });

  const handleEdit = (content: Content) => {
    setSelectedContent(content);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedContent(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, key: string) => {
    if (confirm(`Are you sure you want to delete content "${key}"?`)) {
      try {
        await deleteContent.mutateAsync(id);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to delete content');
      }
    }
  };

  // Group content by section
  const contentBySection = contentData?.content.reduce((acc, content) => {
    if (!acc[content.section]) {
      acc[content.section] = [];
    }
    acc[content.section].push(content);
    return acc;
  }, {} as Record<string, Content[]>) || {};

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-100 text-blue-800';
      case 'html': return 'bg-green-100 text-green-800';
      case 'markdown': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Content Management</h2>
            <p className="text-muted-foreground">
              Manage multilingual content for your website
            </p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Content
          </Button>
        </div>

        {/* Content by Section */}
        {Object.keys(contentBySection).map((section) => (
          <Card key={section}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {section.charAt(0).toUpperCase() + section.slice(1)} Section
                <Badge variant="secondary">
                  {contentBySection[section].length} items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Content (English)</TableHead>
                      <TableHead>Content (Vietnamese)</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contentBySection[section].map((content) => (
                      <TableRow key={content.id}>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            {content.key}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={content.value.en}>
                            {content.value.en}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={content.value.vi}>
                            {content.value.vi}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(content.type)}`}>
                            {content.type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(content)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(content.id, content.key)}
                              disabled={deleteContent.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Show message if no content */}
        {!isLoading && Object.keys(contentBySection).length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No content found</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding some content to manage your website text.
              </p>
              <Button onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Content
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Content Dialog */}
        <ContentDialog
          content={selectedContent}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </div>
    </AdminLayout>
  );
}
