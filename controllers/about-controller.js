import { accountsController } from "./accounts-controller.js";

export const aboutController = {
  async index(req, res) {
    const user = await accountsController.getLoggedInUser(req);

    res.render("about-view", {
      title: "About WeatherTop",
      user,
      active: "about",
      features: {
        base: true,
        iot: true,
        mqtt: true,
        thingspeak: true,
      },
    });
  },
};

