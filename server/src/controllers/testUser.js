import {addUser, deleteUser, getUser, updateUser}  from "../collection/user.collection.js";

export const add = async (req, res) => {
    try {
      const userId = await addUser(req)
      res.status(201).json({ userId })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
}

export const del = async(req,res) => {
  try {
    await deleteUser(req,res)
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}
export const get = async (req, res) => {
  try {
      const userId = req.params.id
      if (!userId) {
          return res.status(400).json({ message: 'User ID is required' })
      }
      const data = await getUser(userId)
      res.status(200).json(data);
  } catch (error) {
      res.status(500).json({ message: error.message })
  }
}

export const up = async (req, res) => {
  try {
    const userId = req.params.id
    const updateData = req.body
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' })
    }

    if (!updateData) {
      return res.status(400).json({ message: 'Update data is required' })
    }
    await updateUser(userId, updateData);
    res.status(200).json({ message: 'User updated successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
};
