class UserRegisterLogic {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.postgresDB = container.resolve("postgresDB");
    this.table = "admindashboardusers";
  }

  async setUserRecordDb(userData) {
    const query = `INSERT INTO ${this.table} (profile_pic, fullname, email, phone, user_role, user_password, referrer_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`;
    const hashedPassword = await this.utility.maskInput(userData.password);
    const params = [
      userData.profilePic,
      userData.fullName,
      userData.email,
      userData.phone,
      userData.userRole,
      hashedPassword,
      userData.referrerId,
    ];
    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  async handleUserRegister(isNewUser, userData) {
    if (!isNewUser) {
      return Promise.reject(null);
    }
    const [err, insertRes] = await this.utility.invoker(
      this.setUserRecordDb(userData)
    );
    if (err) return Promise.reject(err);
    return Promise.resolve(!!insertRes.rowCount);
  }
}

module.exports = UserRegisterLogic;
