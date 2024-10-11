import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import PageTitle from "../PageTitle.jsx";
import LoadingScreen from "../LoadingScreen.jsx";
import UnitFormModal from "./UnitFormModal.jsx";

export default function GeneralClassesPage() {

    return (
        <>
            <PageTitle title="All Classes | StudyGo" />
            <h2>General Classes</h2>
        </>
    );
};