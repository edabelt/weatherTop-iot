import { userStore } from "../models/user-store.js";
import { v4 as uuid } from "uuid";

export const accountsController = {
  login(req, res) {
    res.render("accounts/login-view", { title: "Login" });
  },

  signup(req, res) {
    res.render("accounts/signup-view", { title: "Sign up" });
  },

  async register(req, res) {
    const { firstName, lastName, email, password } = req.body;
    const existing = await userStore.getUserByEmail(email);
    if (existing) {
      return res.render("accounts/signup-view", {
        title: "Sign up",
        error: "Email already registered",
        firstName,
        lastName,
        email,
      });
    }
    const user = { _id: uuid(), firstName, lastName, email, password };
    await userStore.addUser(user);
    res.redirect("/login");
  },

  async authenticate(req, res) {
    const { email, password } = req.body;
    const user = await userStore.getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.render("accounts/login-view", { title: "Login", error: "Invalid credentials", email });
    }
    res.cookie("station", user._id);
    res.redirect("/dashboard");
  },

  async logout(req, res) {
    res.clearCookie("station");
    res.redirect("/");
  },

  async getLoggedInUser(req) {
    const id = req.cookies.station;
    if (!id) return null;
    return userStore.getUserById(id);
  },

  async settings(req, res) {
    const user = await accountsController.getLoggedInUser(req);
    if (!user) return res.redirect("/login");
    res.render("accounts/settings-view", { title: "Settings", user });
  },

  async updateSettings(req, res) {
    const user = await accountsController.getLoggedInUser(req);
    if (!user) return res.redirect("/login");
    const { firstName, lastName, email, password } = req.body;
    const patch = {
      firstName: firstName?.trim() || user.firstName,
      lastName: lastName?.trim() || user.lastName,
      email: email?.trim() || user.email,
    };
    if (password && password.trim().length) patch.password = password.trim();
    await userStore.updateUser(user._id, patch);
    res.redirect("/settings");
  },
};
