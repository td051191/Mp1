import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Settings as SettingsIcon,
  Globe,
  Palette,
  Database,
  Shield,
  Download,
} from "lucide-react";
import { adminExportApi } from "@/lib/admin-api";
import { useState } from "react";

export default function AdminSettings() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const blob = await adminExportApi.exportData();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `minhphat-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Configure your Minh Phát store settings
          </p>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Store Name (English)</Label>
                <Input defaultValue="Minh Phát" />
              </div>
              <div>
                <Label>Store Name (Vietnamese)</Label>
                <Input defaultValue="Minh Phát" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Email</Label>
                <Input defaultValue="hello@minhphat.com" />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input defaultValue="+1 (555) 123-4567" />
              </div>
            </div>

            <div>
              <Label>Store Address</Label>
              <Input defaultValue="123 Farm Street, Fresh Valley" />
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Language & Localization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Default Language</Label>
                <p className="text-sm text-muted-foreground">
                  The primary language for your store
                </p>
              </div>
              <select className="border rounded px-3 py-2">
                <option value="en">English</option>
                <option value="vi">Vietnamese</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Vietnamese</Label>
                <p className="text-sm text-muted-foreground">
                  Allow customers to switch to Vietnamese
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Currency Symbol</Label>
                <Input defaultValue="$" />
              </div>
              <div>
                <Label>Currency Code</Label>
                <Input defaultValue="USD" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Theme & Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable dark theme for admin panel
                </p>
              </div>
              <Switch />
            </div>

            <div>
              <Label>Primary Brand Color</Label>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-8 h-8 bg-fresh-green rounded border"></div>
                <Input defaultValue="#16a34a" className="w-32" />
                <span className="text-sm text-muted-foreground">
                  Fresh Green
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database & Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Database Type</Label>
                <p className="text-sm text-muted-foreground">
                  Currently using in-memory database
                </p>
              </div>
              <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                In-Memory
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically backup data daily
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleExportData}
              disabled={isExporting}
            >
              {isExporting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-fresh-green mr-2"></div>
                  Exporting...
                </div>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Admin Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Require login for admin panel
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>API Rate Limiting</Label>
                <p className="text-sm text-muted-foreground">
                  Limit API requests per minute
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Button variant="outline" className="w-full">
              <Shield className="w-4 h-4 mr-2" />
              Change Admin Password
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button>Save All Settings</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
