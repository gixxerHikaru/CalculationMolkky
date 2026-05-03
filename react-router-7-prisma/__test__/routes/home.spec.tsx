import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Home from "../../app/routes/home";
import { createRoutesStub } from "react-router";
import Welcome from "../../app/welcome/welcome";

test("renders the home page", () => {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: Home,
      children: [
        {
          path: "/welcome",
          Component: Welcome,
        },
      ],
    },
  ]);
  render(<Stub initialEntries={["/welcome"]} />);
  console.log(screen);

  expect(screen.getByText("Welcome to React Router v7!"));
});
