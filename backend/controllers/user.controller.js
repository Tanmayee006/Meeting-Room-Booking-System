import ApiResponse from '../utils/apiResponse.util.js'
import UserService from '../services/user.service.js'

const createUser = async (req, res) => {
  try {
    const { name, email, designation, team } = req.body;
    let data = {name, email, designation, team};
    const user = await UserService.addData(data);
    return res.status(200).json( new ApiResponse(200, user, "User added Successfully", true));
  } 
  catch (error) {
    return res.status(500).json(
        new ApiResponse(500, {}, error.message, 500, false)
      );
  
  }
};

const getUsers = async (req, res) => {
    try {
        const users = await UserService.getData();
        return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully", true));
    } 
    catch (error) {
        return res.status(500).json(new ApiResponse(500, {}, error.message, false));
    }
};
  
const getUserByEmail = async (req, res) => {
    try {
        const user = await UserService.getByEmail(req.params.email);
        if (!user) return res.status(404).json(new ApiResponse(404, {}, "User not found", false));
        return res.status(200).json(new ApiResponse(200, user, "User fetched successfully", true));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, {}, error.message, false));
    }
};

export { createUser, getUsers, getUserByEmail };
