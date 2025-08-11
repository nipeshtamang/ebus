import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { superAdminAPI, UpdateUserData } from "@/services/superadminApi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<UpdateUserData>({
    name: user?.name || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    profileImage: user?.profileImage || "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        profileImage: user.profileImage || "",
      });
      setImagePreview(user.profileImage || null);
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (2MB limit)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        setError("Image size must be less than 2MB");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPG, PNG, or WebP)");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setProfile((prev) => ({
          ...prev,
          profileImage: result,
        }));
        setError(null); // Clear any previous errors
      };
      reader.onerror = () => {
        setError("Failed to read the image file");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    console.log("Current user object:", user); // Debug log
    if (!user?.id) {
      console.error("User ID is missing. User object:", user); // Debug log
      setError("User ID is missing");
      return;
    }

    // Validate required fields
    if (!profile.name?.trim()) {
      setError("Name is required");
      return;
    }

    if (!profile.email?.trim()) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("Updating profile with data:", profile); // Debug log
      const response = await superAdminAPI.updateProfile(profile);
      console.log("Profile update response:", response.data); // Debug log
      updateUser(response.data);
      setEditing(false);
    } catch (err: any) {
      console.error("Error updating profile:", err); // Debug log

      // Handle specific error messages
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to update profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-white to-teal-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Profile
        </h1>
        <div className="flex justify-center">
          <Card className="max-w-xl w-full">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {imagePreview ? (
                    <AvatarImage src={imagePreview} alt={profile.name} />
                  ) : (
                    <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                {editing && (
                  <div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageChange}
                            className="block mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                            aria-label="Upload profile image"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          Upload a new profile image (max 2MB, JPG/PNG)
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="text-xs text-muted-foreground mt-1">
                      Max size: 2MB. Supported formats: JPG, PNG, WebP
                    </div>
                  </div>
                )}
                <div>
                  <div className="font-semibold text-lg">{profile.name}</div>
                  <div className="text-muted-foreground">{user.role}</div>
                </div>
              </div>
              <div className="grid gap-2">
                <label>Email</label>
                <Input
                  name="email"
                  value={profile.email || ""}
                  onChange={handleChange}
                  readOnly={!editing}
                  aria-label="Email"
                />
              </div>
              <div className="grid gap-2">
                <label>Phone Number</label>
                <Input
                  name="phoneNumber"
                  value={profile.phoneNumber || ""}
                  onChange={handleChange}
                  readOnly={!editing}
                  aria-label="Phone Number"
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      aria-label="Save profile changes"
                    >
                      {loading ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditing(false)}
                      aria-label="Cancel editing profile"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setEditing(true)}
                    aria-label="Edit profile"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
