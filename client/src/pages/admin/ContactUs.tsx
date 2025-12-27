import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Trash2, Mail, Phone, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

interface ContactSettings {
  id: string;
  email?: string;
  phone?: string;
  address?: string;
  businessHours?: string;
  whatsappUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
}

export default function ContactUsAdmin() {
  const { toast } = useToast();
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [settings, setSettings] = useState<ContactSettings>({
    id: "1",
    email: "",
    phone: "",
    address: "",
    businessHours: "",
  });

  // Fetch contact messages
  const { data: messages = [], refetch: refetchMessages, isLoading } = useQuery({
    queryKey: ["/api/admin/contact-messages"],
  });

  // Fetch contact settings
  const { data: dbSettings, refetch: refetchSettings } = useQuery({
    queryKey: ["/api/admin/contact-settings"],
  });

  // Update settings when dbSettings changes
  useEffect(() => {
    if (dbSettings) {
      setSettings(dbSettings);
    }
  }, [dbSettings]);

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/contact-messages/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete message");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
      refetchMessages();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: ContactSettings) => {
      const response = await fetch("/api/admin/contact-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Contact settings updated successfully",
      });
      setIsEditingSettings(false);
      refetchSettings();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleSettingsChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  const unreadCount = messages.filter((m: ContactMessage) => m.status === "unread").length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Contact Us Management</h1>
            <span className="text-2xl font-semibold text-black">
              ({messages.length})
            </span>
          </div>
          <p className="text-muted-foreground mt-2">Manage contact messages and configure contact information</p>
        </div>
      </div>

      {/* Contact Settings */}
      <div className="bg-white p-8 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Contact Information</h2>
          <Button
            onClick={() => setIsEditingSettings(!isEditingSettings)}
            variant={isEditingSettings ? "destructive" : "default"}
          >
            {isEditingSettings ? "Cancel" : "Edit"}
          </Button>
        </div>

        {isEditingSettings ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
              <input
                type="email"
                value={settings.email || ""}
                onChange={(e) => handleSettingsChange("email", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
              <input
                type="tel"
                value={settings.phone || ""}
                onChange={(e) => handleSettingsChange("phone", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Address</label>
              <textarea
                value={settings.address || ""}
                onChange={(e) => handleSettingsChange("address", e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Business Hours</label>
              <input
                type="text"
                value={settings.businessHours || ""}
                onChange={(e) => handleSettingsChange("businessHours", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none"
                placeholder="e.g., Monday - Friday, 9am - 6pm EST"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media Links</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">WhatsApp URL</label>
                  <input
                    type="url"
                    value={settings.whatsappUrl || ""}
                    onChange={(e) => handleSettingsChange("whatsappUrl", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none"
                    placeholder="https://wa.me/94777466766"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Instagram URL</label>
                  <input
                    type="url"
                    value={settings.instagramUrl || ""}
                    onChange={(e) => handleSettingsChange("instagramUrl", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none"
                    placeholder="https://www.instagram.com/modfyofficial"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Facebook URL</label>
                  <input
                    type="url"
                    value={settings.facebookUrl || ""}
                    onChange={(e) => handleSettingsChange("facebookUrl", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none"
                    placeholder="https://www.facebook.com/share/1BPUVhhXYR/"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">TikTok URL</label>
                  <input
                    type="url"
                    value={settings.tiktokUrl || ""}
                    onChange={(e) => handleSettingsChange("tiktokUrl", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none"
                    placeholder="https://www.tiktok.com/@modfy.official"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleSaveSettings}
              disabled={updateSettingsMutation.isPending}
              className="w-full"
            >
              {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <Mail className="w-5 h-5 text-gray-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{settings.email}</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Phone className="w-5 h-5 text-gray-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{settings.phone}</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <MapPin className="w-5 h-5 text-gray-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium text-gray-900">{settings.address}</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Clock className="w-5 h-5 text-gray-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Business Hours</p>
                <p className="font-medium text-gray-900">{settings.businessHours}</p>
              </div>
            </div>
          </div>
        )}

        {!isEditingSettings && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">WhatsApp</p>
                <a href={settings.whatsappUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                  {settings.whatsappUrl || "Not set"}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-600">Instagram</p>
                <a href={settings.instagramUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                  {settings.instagramUrl || "Not set"}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-600">Facebook</p>
                <a href={settings.facebookUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                  {settings.facebookUrl || "Not set"}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-600">TikTok</p>
                <a href={settings.tiktokUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                  {settings.tiktokUrl || "Not set"}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Messages */}
      <div className="bg-white p-8 border border-gray-200 rounded-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Contact Messages
            <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              {unreadCount} Unread
            </span>
          </h2>
          <p className="text-gray-600 mt-2">
            Total: <strong>{messages.length}</strong> messages
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-gray-600">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center py-12">
            <p className="text-gray-600">No contact messages yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Subject</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message: ContactMessage) => (
                  <tr key={message.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{message.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{message.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={message.subject}>
                        {message.subject}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {format(new Date(message.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${message.status === "unread"
                          ? "bg-yellow-100 text-yellow-800"
                          : message.status === "replied"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {message.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => deleteMessageMutation.mutate(message.id)}
                        disabled={deleteMessageMutation.isPending}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
