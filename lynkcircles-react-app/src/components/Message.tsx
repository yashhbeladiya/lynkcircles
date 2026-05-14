//@ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../hooks/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Chat from "./Chat";
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
  MenuItem,
} from "@mui/material";
import {
  Send as SendIcon,
  Search as SearchIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  EmojiEmotions as EmojiIcon,
  ThumbUp as LikeIcon,
  Mood as ReactionIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";

import { useSocket, useSendMessage } from "../hooks/useSocket";
import e from "express";

const Message = () => {
  const theme = useTheme();
  const { socket, isAuthenticated, authUser, isLoading } = useSocket();
  const { sendMessage } = useSendMessage();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [fileToUpload, setFileToUpload] = useState(null);
  const [reactionAnchor, setReactionAnchor] = useState(null);
  const [selectedMessageForReaction, setSelectedMessageForReaction] =
    useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const typingTimeoutRef = useRef(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const { data: messageHistory, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["messages", selectedContact?._id],
    queryFn: async () => {
      if (!selectedContact?._id) return [];
      const response = await axiosInstance.get(
        `/messages/${selectedContact._id}`
      );
      return response.data;
    },
    enabled: !!selectedContact?._id, // Only run query when a contact is selected
  });

  useEffect(() => {
    if (messageHistory) {
      setMessages(
        messageHistory.map((msg) => ({
          ...msg,
          status: msg.sender === authUser._id ? "sent" : "received",
        }))
      );
    }
  }, [messageHistory, selectedContact]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // File Upload Handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Determine file type
      const fileType = file.type.split("/")[0];
      setFileToUpload({
        file,
        type:
          fileType === "image"
            ? "image"
            : ["pdf", "doc", "docx"].includes(file.type.split("/")[1])
            ? "document"
            : file.type.split("/")[0],
      });
    }
  };

  const { data: contacts } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const response = await axiosInstance.get("/connections");
      return response.data;
    },
  });

  // Reaction Management
  const handleReaction = (reaction) => {
    // Add reaction to specific message
    // This would typically involve a backend call to update message reactions
    setReactionAnchor(null);
  };

  useEffect(() => {
    if (!socket) return;

    // Handle incoming messages
    socket.on("newMessage", (data) => {
      setMessages((prev) => {
        // Check if message already exists to prevent duplicates
        const messageExists = prev.some(
          (msg) =>
            msg._id === data.message._id || msg.tempId === data.message.tempId
        );

        if (messageExists) return prev;

        return [
          ...prev,
          {
            ...data.message,
            sender: data.sender,
            status: "received",
          },
        ];
      });
    });

    // Handle message sent confirmation
    socket.on("messageSent", (message) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === message.tempId ? { ...message, status: "sent" } : msg
        )
      );
    });

    // Message read status handler
    socket.on("messageRead", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status: "read" } : msg
        )
      );
    });

    // Handle typing indicators
    socket.on("userTyping", ({ userId, isTyping }) => {
      if (selectedContact?.id === userId) {
        setIsTyping(isTyping);
      }
    });

    // Handle online status
    socket.on("userOnline", (userId) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socket.on("userOffline", (userId) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageSent");
      socket.off("userTyping");
      socket.off("userOnline");
      socket.off("userOffline");
      socket.off("messageRead");
    };
  }, [socket, selectedContact]);

  // Mark received messages as read
  useEffect(() => {
    if (!socket || !selectedContact) return;

    const unreadMessages = messages.filter(
      (msg) => msg.sender === selectedContact._id && msg.status === "received"
    );

    if (unreadMessages.length > 0) {
      unreadMessages.forEach((msg) => {
        socket.emit("markMessageRead", {
          messageId: msg._id,
          senderId: selectedContact._id,
        });
      });

      // Update local message status
      setMessages((prev) =>
        prev.map((msg) =>
          unreadMessages.some((unread) => unread._id === msg._id)
            ? { ...msg, status: "read" }
            : msg
        )
      );
    }
  }, [messages, selectedContact, socket]);

  // Modified send message handler with proper error handling and logging
  const handleSendMessage = async () => {
    console.log("Attempting to send message...");
    console.log("Current state:", {
      newMessage,
      fileToUpload,
      selectedContact,
      socketConnected: socket?.connected,
    });

    if (!newMessage.trim() && !fileToUpload) {
      console.log("No message or file to send");
      return;
    }

    if (!selectedContact) {
      console.log("No contact selected");
      return;
    }

    console.log("Socket:", socket);

    if (!socket?.connected) {
      console.error("Socket not connected");
      return;
    }

    const tempId = Date.now().toString();

    let fileUrl = null;
    if (fileToUpload) {
      try {
        const formData = new FormData();
        formData.append("file", fileToUpload.file);

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/v1/messages/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`File upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        fileUrl = data.url;
      } catch (error) {
        console.error("File upload failed:", error);
        return;
      }
    }

    const messageData = {
      tempId,
      content: newMessage,
      fileUrl,
      fileType: fileToUpload?.type,
      sender: authUser._id,
      recipient: selectedContact._id,
      status: "sending",
    };

    try {
      // Add message to local state first
      setMessages((prev) => [...prev, messageData]);

      // Emit message through socket
      console.log("Emitting message:", {
        recipientId: selectedContact._id,
        content: newMessage,
        attachmentId: fileUrl,
        tempId,
      });

      socket.emit(
        "privateMessage",
        {
          recipientId: selectedContact._id,
          content: newMessage,
          attachmentId: fileUrl ? fileUrl : null,
          tempId,
        },
        (acknowledgement) => {
          // Handle acknowledgement from server
          console.log("Message acknowledgement received:", acknowledgement);
        }
      );

      // Clear input states
      setNewMessage("");
      setFileToUpload(null);
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally remove the message from local state if sending failed
      setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
      // You might want to show an error notification to the user here
    }
  };

  // Send typing indicator
  const handleTyping = (event) => {
    setNewMessage(event.target.value);

    // Only emit typing event if socket and selectedContact exist
    if (socket && selectedContact) {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Emit typing status
      socket.emit("typing", {
        recipientId: selectedContact._id,
        isTyping: true,
      });

      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", {
          recipientId: selectedContact._id,
          isTyping: false,
        });
      }, 2000);
    }
  };

  // Render Message with Reactions
  const renderMessage = (message) => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: message.sender === "current" ? "flex-end" : "flex-start",
        mb: 2,
      }}
    >
      <Paper
        sx={{
          p: 1.5,
          maxWidth: "70%",
          backgroundColor: message.sender === "current" ? "#333366" : "#f1f1f1",
          color: message.sender === "current" ? "white" : "black",
          position: "relative",
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setSelectedMessageForReaction(message);
          setReactionAnchor(e.currentTarget);
        }}
      >
        {message.fileUrl && (
          <Box mb={1}>
            {message.fileType === "image" ? (
              <img
                src={message.fileUrl}
                alt="Uploaded"
                style={{ maxWidth: "100%", borderRadius: "8px" }}
              />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(0,0,0,0.1)",
                  p: 1,
                  borderRadius: 1,
                }}
              >
                <AttachFileIcon sx={{ mr: 1 }} />
                <Typography variant="body2">{message.fileType} File</Typography>
              </Box>
            )}
          </Box>
        )}
        <Typography variant="body2">{message.content}</Typography>
        {message.status === "read" && (
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              bottom: -15,
              right: 0,
              color: "green",
            }}
          >
            ✓✓ Read
          </Typography>
        )}
      </Paper>
    </Box>
  );

  const renderMessages = () => (
    <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
      {messages.map((message, index) => (
        <React.Fragment key={message.tempId || message._id || index}>
          {renderMessage(message)}
        </React.Fragment>
      ))}

      {/* Typing indicator */}
      {isTyping && (
        <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
          <Typography variant="caption" color="textSecondary">
            {selectedContact.name} is typing...
          </Typography>
        </Box>
      )}
      <div ref={messagesEndRef} />
    </Box>
  );

  const renderContact = (contact) => (
    <ListItem
      button
      selected={selectedContact?._id === contact._id}
      onClick={() => {
        setSelectedContact({
          id: contact._id, // Keep id for socket operations
          _id: contact._id, // Keep _id for UI operations
          name: contact.firstName + " " + contact.lastName,
          avatar: contact.profilePicture,
        });
        if (isMobile) {
          setMobileOpen(false);
        }
      }}
    >
      <ListItemAvatar>
        <Avatar src={contact.profilePicture}>
          {contact.firstName?.[0]}
          {/* Online status indicator */}
          {onlineUsers.has(contact._id) && (
            <Box
              sx={{
                position: "absolute",
                bottom: 2,
                right: 2,
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: "success.main",
                border: "2px solid white",
              }}
            />
          )}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={`${contact.firstName} ${contact.lastName}`}
        secondary={contact.lastMessage}
      />
    </ListItem>
  );

  const renderConnectionStatus = () => (
    <Box
      sx={{
        position: "fixed",
        top: 10,
        right: 10,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: socketConnected ? "green" : "red",
        }}
      />
      <Typography variant="caption">
        {socketConnected ? "Connected" : "Disconnected"}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      {renderConnectionStatus()}

      {/* Contacts List (Mobile Drawer or Sidebar) */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: "80%",
              boxSizing: "border-box",
            },
          }}
        >
          <Box sx={{ width: "300px", overflowY: "auto" }}>
            {/* Search Input */}
            <TextField
              variant="outlined"
              placeholder="Search contacts..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* Contacts List */}
            <List>
              {contacts?.map((contact) => (
                <React.Fragment key={contact.id}>
                  {renderContact(contact)}
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Box>
        </Drawer>
      ) : (
        // Desktop Sidebar
        <Box
          sx={{
            width: "300px",
            borderRight: "1px solid #e0e0e0",
            overflowY: "auto",
          }}
        >
          {/* Search Input */}
          <TextField
            variant="outlined"
            placeholder="Search contacts..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* Contacts List */}
          <List>
            {contacts?.map((contact) => (
              <React.Fragment key={contact.id}>
                {renderContact(contact)}
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}

      {/* Message Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Messages List */}
        {selectedContact ? (
          <Box
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            {/* Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: "1px solid #e0e0e0",
                display: "flex",
                alignItems: "center",
              }}
            >
              <IconButton
                color="primary"
                onClick={() => setMobileOpen(true)}
                sx={{ display: isMobile ? "block" : "none" }}
              >
                <MenuIcon />
              </IconButton>

              <Avatar src={selectedContact.avatar} sx={{ mr: 2 }} />
              <Typography variant="h6">{selectedContact.name}</Typography>
            </Box>

            {isLoadingMessages ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <Typography>Loading messages...</Typography>
              </Box>
            ) : (
              renderMessages()
            )}
            {/* <Chat
              userId={authUser._id}
              recipient={selectedContact}
              /> */}
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexGrow: 1,
            }}
          >
            <Typography variant="h6" color="textSecondary">
              Select a contact to start messaging
            </Typography>
          </Box>
        )}

        {/* Message Input Area - Always Visible */}
        {selectedContact && (
          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              borderTop: "1px solid #e0e0e0",
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
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
              onChange={(e) => {
                handleTyping(e);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={!selectedContact}
              sx={{ mx: 1 }}
            />

            <IconButton
              color="#333366"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && !fileToUpload}
            >
              <SendIcon />
            </IconButton>
          </Box>
        )}

        {/* Reaction Menu */}
        <Menu
          anchorEl={reactionAnchor}
          open={Boolean(reactionAnchor)}
          onClose={() => setReactionAnchor(null)}
        >
          {["like", "love", "laugh", "sad"].map((reaction) => (
            <MenuItem key={reaction} onClick={() => handleReaction(reaction)}>
              <ReactionIcon /> {reaction}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Box>
  );
};
export default Message;
