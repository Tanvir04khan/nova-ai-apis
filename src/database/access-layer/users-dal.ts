import { eq, or } from "drizzle-orm";
import { Database } from "..";
import { users } from "../schema";

class UserDAL {
  readonly database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  getUserById(userId: string) {
    return this.database
      .select({
        userId: users.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phoneNumber: users.phoneNumber,
        refreshToken: users.refreshToken,
        refreshTokenExpiry: users.refreshTokenExpiry,
      })
      .from(users)
      .where(eq(users.userId, userId));
  }

  createUser(
    firstName: string,
    lastName: string,
    email: string,
    passwordHash: string,
    createdBy: string,
    phoneNumber?: string,
  ) {
    return this.database
      .insert(users)
      .values({
        firstName,
        lastName,
        email,
        phoneNumber,
        password: passwordHash,
        createdBy,
        modifiedBy: createdBy,
      })
      .returning({
        userId: users.userId,
      });
  }

  saveRefreshToken(userId: string, refreshToken: string, expiry: Date) {
    return this.database
      .update(users)
      .set({
        refreshToken,
        refreshTokenExpiry: expiry,
        updatedAt: new Date(),
        modifiedBy: "System",
      })
      .where(eq(users.userId, userId));
  }

  checkUserExist(email: string, phoneNumber: string) {
    return this.database
      .select({
        email: users.email,
        phoneNumber: users.phoneNumber,
      })
      .from(users)
      .where(or(eq(users.email, email), eq(users.phoneNumber, phoneNumber)));
  }

  getLoginDetails(email: string, phoneNumber: string) {
    return this.database
      .select({
        userId: users.userId,
        email: users.email,
        phoneNumber: users.phoneNumber,
        password: users.password,
      })
      .from(users)
      .where(or(eq(users.email, email), eq(users.phoneNumber, phoneNumber)));
  }
}

export default UserDAL;
