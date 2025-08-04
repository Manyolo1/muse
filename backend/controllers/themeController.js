import Theme from "../models/Theme.js";

const createTheme=async(req,res)=>{
    try{

        const {name,description,color}=req.body;
        const userId=req.user.userId;

        // one user cannot have multiple same themes 
        const existing=await Theme.findOne({name,user:userId});
        if(existing) return res.status(400).json({error:'Theme already exists'});

        const theme=new Theme(
            {name,description,color,user:userId}
        );
        await theme.save();

        res.status(201).json(theme);
        
    } catch(err){
        console.error(err);
        res.status(500).json({error:'Theme creation failed'});
    }
}

const deleteTheme = async (req, res) => {
  try {
    const userId = req.user.userId;      // from auth middleware
    const { id } = req.params;            // theme ID from URL

    // Check theme exists and belongs to the requesting user
    const theme = await Theme.findOne({ _id: id, user: userId });
    if (!theme) {
      return res.status(404).json({ error: 'Theme not found or not owned by user' });
    }

    // Check if any thoughts linked to this theme
    const linkedThoughts = await Thought.findOne({ theme: id });
    if (linkedThoughts) {
      return res.status(400).json({
        error: 'Cannot delete theme with associated thoughts. Please reassign or delete related thoughts first.'
      });
    }

    // Delete the theme
    await Theme.deleteOne({ _id: id });

    // Respond with success message
    res.status(200).json({ message: 'Theme deleted successfully' });

  } catch (err) {
    console.error('Error deleting theme:', err);
    res.status(500).json({ error: 'Internal server error while deleting theme' });
  }
};

const updateTheme = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name, description, color } = req.body;

    // Validate required fields (at least name or color or description should be updated)
    if (!name && !description && !color) {
      return res.status(400).json({ error: 'At least one field (name, description, or color) is required to update.' });
    }

    // Find the theme and ensure it belongs to this user
    const theme = await Theme.findOne({ _id: id, user: userId });
    if (!theme) {
      return res.status(404).json({ error: 'Theme not found or access denied.' });
    }

    // Check if the name is getting updated, then ensure uniqueness per user
    if (name && name !== theme.name) {
      const existing = await Theme.findOne({ user: userId, name });
      if (existing) {
        return res.status(400).json({ error: 'A theme with this name already exists.' });
      }
      theme.name = name;
    }

    if (description !== undefined) {
      theme.description = description;
    }

    if (color !== undefined) {
      theme.color = color;
    }

    await theme.save();

    res.json(theme);

  } catch (err) {
    console.error('Update theme error:', err);
    res.status(500).json({ error: 'Failed to update theme.' });
  }
};

export {createTheme,updateTheme,deleteTheme};
