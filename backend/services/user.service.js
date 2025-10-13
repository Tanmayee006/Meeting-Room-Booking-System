import User from '../models/user.model.js';

class UserService {
  async addData(data) {
    let user = await User.create(data);
    return user;
  }

  async getData(){
    let users = await User.find();
    return users;
  }

  async getByEmail(email){
    let user = await User.findOne({ email });
    return user;
  }
};



export default new UserService();
