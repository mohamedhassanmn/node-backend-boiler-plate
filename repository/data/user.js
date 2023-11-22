class User {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.postgresDB = container.resolve("postgresDB");
    this.dashboardUsersTable = "adminDashboardUsers";
  }

  async checkUserRegistered(email) {
    const query = `SELECT * FROM ${this.dashboardUsersTable} 
        WHERE email=$1`;
    const params = [email];
    const [dbErr, dbRes] = await this.utility.invoker(
      this.postgresDB.executeQuery(query, params)
    );
    if (dbErr) return Promise.reject(dbErr);
    return Promise.resolve(!dbRes.rowCount);
  }

  async fetchUserRegisteredInfo(email) {
    const query = `SELECT * FROM ${this.dashboardUsersTable} 
        WHERE email=$1`;
    const params = [email];
    const [dbErr, dbRes] = await this.utility.invoker(
      this.postgresDB.executeQuery(query, params)
    );
    if (dbErr) return Promise.reject(dbErr);
    return Promise.resolve(dbRes.rows[0]);
  }

  async fetchAllUserMatches(colName, colValue) {
    const query = `SELECT * FROM ${this.dashboardUsersTable} 
        WHERE ${colName}=$1`;
    const params = [colValue];
    const [dbErr, dbRes] = await this.utility.invoker(
      this.postgresDB.executeQuery(query, params)
    );
    if (dbErr) return Promise.reject(dbErr);
    return Promise.resolve(dbRes.rows || []);
  }

  async updateUserPassword(updatedPassword, userId) {
    const query = `UPDATE ${this.dashboardUsersTable} SET user_password=$1
    WHERE id = ${userId}`;
    const params = [updatedPassword];
    const [dbErr, dbRes] = await this.utility.invoker(
      this.postgresDB.executeQuery(query, params)
    );
    if (dbErr) return Promise.reject(dbErr);
    return Promise.resolve("");
  }
}

module.exports = User;
