import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "../layout/root-layout";

// Pages import
import Home from "../pages/home/Home";
import ChallengeChoice from "../pages/challenge/ChallengeChoice";
import ChallengeMain from "../pages/challenge/ChallengeMain";
import Shopping from "../pages/shopping/Shopping";
import Restaurant from "../pages/restaurant/Restaurant";
import Community from "../pages/community/community";
import NotFound from "../pages/NotFound";

// Challenge Main Components import (경로 수정!)
import MealContainer from "../pages/challenge/mainComponents/todaysMealTab/MealContainer";
import ProgressContainer from "../pages/challenge/mainComponents/progressTab/ProgressContainer";
import RecipeTab from "../pages/challenge/mainComponents/challengeContent/RecipeTab";
import ShoppingTab from "../pages/challenge/mainComponents/challengeContent/ShoppingTab";

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        errorElement: <NotFound />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: "challenge",
                element: <ChallengeChoice />,
            },
            {
                path: "community",
                element: <Community />,
            },
            {
                path: "store",
                element: <Shopping />,
            },
            {
                path: "map",
                element: <Restaurant />,
            },
            {
                path: "challenge/main",
                element: <ChallengeMain />,
                children: [
                    {
                        index: true,
                        element: <Navigate to="meal" replace />,
                    },
                    {
                        path: "meal",
                        element: <MealContainer />,
                    },
                    {
                        path: "progress",
                        element: <ProgressContainer />,
                    },
                    {
                        path: "recipe",
                        element: <RecipeTab />,
                    },
                    {
                        path: "shopping",
                        element: <ShoppingTab />,
                    },
                ],
            },
        ],
    },
]);

export default router;