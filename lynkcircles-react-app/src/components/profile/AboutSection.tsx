import React from "react";
import { TextField, Typography, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { FaCheck } from "react-icons/fa";


const AboutSection = ({
  userData,
  isOwnProfile,
  onSave,
}: {
  userData: any;
  isOwnProfile: boolean;
  onSave: (e: any) => void;
}) => {
  const [bio, setBio] = React.useState(userData.bio || "");
  const [isEditing, setIsEditing] = React.useState(false);

  const handleSave = () => {
    onSave({ bio });
  };
  return (
    <div
      className="bg-white shadow-lg rounded-lg overflow-hidden p-5 mt-2"
      style={{ position: "relative" }}
    >
      <Typography variant="h6" gutterBottom>
        About
      </Typography>
      {isOwnProfile && (
        <IconButton
          sx={{ position: "absolute", top: 8, right: 8 }}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (<FaCheck size="23" color="#333366" onClick={handleSave}/> ) : ( <EditIcon color="secondary" /> )}
        </IconButton>
      )}
      {isEditing ? (
        <TextField
          margin="dense"
          fullWidth
          multiline
          variant="outlined"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          style={{ width: "100%", padding: 8 }}
        />
      ) : (
        <Typography variant="body1">{bio || "No bio available."}</Typography>
      )}
    </div>
  );
};

export default AboutSection;
