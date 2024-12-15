//@ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip 
} from '@mui/material';
import { 
  FaMapMarkerAlt, 
  FaMoneyBillWave 
} from 'react-icons/fa';

const WorkPostCard = ({ workPost }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/works/${workPost._id}`);
  };

  return (
    <Card 
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        border: '1px solid #333366', 
        borderRadius: 2,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }
      }}
      onClick={handleCardClick}
    >
      <CardContent>
        <Typography variant="h6" color="#333366" sx={{ mb: 1 }}>
          {workPost.jobTitle}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <FaMapMarkerAlt color="#333366" />
          <Typography variant="body2" color="text.secondary">
            {workPost.location || 'Location Not Specified'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <FaMoneyBillWave color="#333366" />
          <Typography variant="body2" color="text.secondary">
            {workPost.budget || 'Pay Negotiable'}
          </Typography>
        </Box>

        {workPost.skillsRequired && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {workPost.skillsRequired.slice(0, 3).map((skill) => (
              <Chip 
                key={skill} 
                label={skill} 
                size="small" 
                color="secondary" 
                variant="outlined"
              />
            ))}
            {/* {workPost.skills.length > 3 && (
              <Chip 
                label={`+${workPost.skills.length - 3}`} 
                size="small" 
                color="default" 
                variant="outlined"
              />
            )} */}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkPostCard;