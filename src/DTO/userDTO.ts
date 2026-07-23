import type { UserRow } from "../models/Users/userModel";

export type UserResponseDTO = Omit<UserRow, "password_hash" | "id">;

export function toUserResponseDTO(user: UserRow): UserResponseDTO {
  const { password_hash, id, ...userDTO } = user;
  return userDTO;
}
