//@ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Paper, 
  Divider,
  InputAdornment,
  Drawer,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Send as SendIcon, 
  Search as SearchIcon, 
  AttachFile as AttachFileIcon, 
  Image as ImageIcon,
  EmojiEmotions as EmojiIcon,
  ThumbUp as LikeIcon,
  Mood as ReactionIcon
} from '@mui/icons-material';

const Message = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);
  const [reactionAnchor, setReactionAnchor] = useState(null);
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // File Upload Handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Determine file type
      const fileType = file.type.split('/')[0];
      setFileToUpload({
        file,
        type: fileType === 'image' ? 'image' : 
              ['pdf', 'doc', 'docx'].includes(file.type.split('/')[1]) ? 'document' : 
              file.type.split('/')[0]
      });
    }
  };

  // Send Message with Optional File
  const handleSendMessage = async () => {
    if ((newMessage.trim() || fileToUpload) && selectedContact) {
      let fileUrl = null;
      
      // Upload file to storage (e.g., AWS S3, Firebase)
      if (fileToUpload) {
        // Implement file upload logic here
        // fileUrl = await uploadToStorage(fileToUpload.file);
      }

      const messagePayload = {
        content: newMessage,
        fileUrl,
        fileType: fileToUpload?.type,
        recipient: selectedContact.id,
        sender: 'current', // Assuming 'current' is the current user
        status: 'sent'
      };

      // Send message via API
      // await sendMessage(messagePayload);

      // Update local state
      setMessages(prev => [...prev, messagePayload]);
      
      // Reset states
      setNewMessage('');
      setFileToUpload(null);
    }
  };

  // Reaction Management
  const handleReaction = (reaction) => {
    // Add reaction to specific message
    // This would typically involve a backend call to update message reactions
    setReactionAnchor(null);
  };

  // Render Message with Reactions
  const renderMessage = (message) => (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: message.sender === 'current' ? 'flex-end' : 'flex-start',
        mb: 2 
      }}
    >
      <Paper 
        sx={{ 
          p: 1.5, 
          maxWidth: '70%',
          backgroundColor: message.sender === 'current' ? '#333366' : '#f1f1f1',
          color: message.sender === 'current' ? 'white' : 'black',
          position: 'relative'
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setSelectedMessageForReaction(message);
          setReactionAnchor(e.currentTarget);
        }}
      >
        {message.fileUrl && (
          <Box mb={1}>
            {message.fileType === 'image' ? (
              <img 
                src={message.fileUrl} 
                alt="Uploaded" 
                style={{ maxWidth: '100%', borderRadius: '8px' }} 
              />
            ) : (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  backgroundColor: 'rgba(0,0,0,0.1)', 
                  p: 1, 
                  borderRadius: 1 
                }}
              >
                <AttachFileIcon sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {message.fileType} File
                </Typography>
              </Box>
            )}
          </Box>
        )}
        <Typography variant="body2">
          {message.content}
        </Typography>
        {message.status === 'read' && (
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute', 
              bottom: -15, 
              right: 0, 
              color: 'green' 
            }}
          >
            ✓✓ Read
          </Typography>
        )}
      </Paper>
    </Box>
  );

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        height: '100vh', 
        overflow: 'hidden',
        flexDirection: isMobile ? 'column' : 'row'
      }}
    >
      {/* Contacts List (Mobile Drawer or Sidebar) */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { 
              width: '80%', 
              boxSizing: 'border-box' 
            },
          }}
        >
          {/* Contact List Content */}
        </Drawer>
      ) : (
        // Desktop Sidebar
        <Box 
          sx={{ 
            width: '300px', 
            borderRight: '1px solid #e0e0e0', 
            overflowY: 'auto' 
          }}
        >
          {/* Contact List Content */}
        </Box>
      )}

      {/* Message Area */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%' 
        }}
      >
        {/* Messages List */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
          {messages.map((message, index) => (
            <React.Fragment key={index}>
              {renderMessage(message)}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        {/* Message Input Area - Always Visible */}
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            borderTop: '1px solid #e0e0e0' 
          }}
        >
          {/* File Upload Input */}
          <input 
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          
          <IconButton onClick={() => fileInputRef?.current?.click()}>
            <AttachFileIcon />
          </IconButton>
          
          <IconButton>
            <ImageIcon />
          </IconButton>
          
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            sx={{ mx: 1 }}
          />
          
          <IconButton 
            color="primary" 
            onClick={handleSendMessage}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Reaction Menu */}
      <Menu
        anchorEl={reactionAnchor}
        open={Boolean(reactionAnchor)}
        onClose={() => setReactionAnchor(null)}
      >
        {['like', 'love', 'laugh', 'sad'].map((reaction) => (
          <MenuItem 
            key={reaction} 
            onClick={() => handleReaction(reaction)}
          >
            <ReactionIcon /> {reaction}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default Message;