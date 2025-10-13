import User from '../models/user.model.js';

class UserService {
  async addData(data) {

    const user = await User.create(data);
    return user;
  }

  async getData(){
    const users = await User.find();
    return users;
  }

  async getByEmail(email){
    const user = await User.findOne({ email });
    return user;
  }
};



export default new UserService();
