import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faTimes } from '@fortawesome/free-solid-svg-icons';
import '../styles/Walkthrough.css';

export default function Walkthrough({
    walkthroughData,
    setWalkthrough,
    setHiddenWalkthrough
}) {
    const [focusedElement, setFocusedElement] = useState(null);
    const [totalSteps, setTotalSteps] = useState(1);
    const [currentStepIndex, setCurrentStepIndex] = useState(1)
    const [currentStep, setCurrentStep] = useState(null);

    const mediaTypes = new Map([["jpg", "img"], ["gif", "img"], ["mp4", "video"], ["3gp", "video"]]);

    useEffect(() => {
        setCurrentStep(
            walkthroughData?.steps?.find((step) => step.index === currentStepIndex)
        );
    }, [currentStepIndex, walkthroughData.steps, walkthroughData]);
    
    useEffect(() => {
        if (focusedElement) {
            focusedElement.classList.remove("walkthrough-focused-element");
        };

        const walkthroughContent = document.getElementById("walkthrough-content");
    
        if (currentStep?.focusedElement) {
            const element = document.getElementById(currentStep.focusedElement);
        
            if (element) {
                element.classList.add("walkthrough-focused-element");
                
                const elementRect = element.getBoundingClientRect();
                const elementRight = elementRect.right;
                const elementLeft = elementRect.left;
                const walkthroughWidth = walkthroughContent.offsetWidth;
        
                const remainingWidth = window.innerWidth - elementRect.width;
        
                if (elementRight < window.innerWidth / 2) {
                    walkthroughContent.style.left = `${elementRight + 10}px`;
                    walkthroughContent.style.right = "auto";
                    walkthroughContent.style.maxWidth = `${remainingWidth > walkthroughWidth ? walkthroughWidth : remainingWidth}px`;
                    walkthroughContent.style.transform = "translate(0, -50%)";
                } else {
                    walkthroughContent.style.left = "auto";
                    walkthroughContent.style.right = `${window.innerWidth - elementLeft + 10}px`;
                    walkthroughContent.style.maxWidth = `${remainingWidth > walkthroughWidth ? walkthroughWidth : remainingWidth}px`;
                    walkthroughContent.style.transform = "translate(0, -50%)";
                };
        
                setFocusedElement(element);
            } else {
                console.warn(`Element with ID ${currentStep.focusedElement} not found.`);
            };
        } else {
            setFocusedElement(null);
            walkthroughContent.style.left = "50%";
            walkthroughContent.style.right = "auto";
            walkthroughContent.style.maxWidth = "35vw";
            walkthroughContent.style.transform = "translate(-50%, -50%)";
        };
    
        return () => {
            if (focusedElement) {
                focusedElement.classList.remove("walkthrough-focused-element");
            };
        };
    }, [currentStep, focusedElement]);
    

    useEffect(() => {
        setTotalSteps(walkthroughData?.steps?.length);
    }, [walkthroughData]);

    const stepChange = (type) => {
        if (type === "next") {
            setCurrentStepIndex((prevIndex) => prevIndex + 1);
        } else if (type === "back") {
            setCurrentStepIndex((prevIndex) => prevIndex - 1);
        } else if (type === "close") {
            let hiddenWalkthrough = JSON.parse(localStorage.getItem("hiddenWalkthrough")) || [];
            hiddenWalkthrough.push(walkthroughData.page);
            localStorage.setItem("hiddenWalkthrough", JSON.stringify(hiddenWalkthrough));
            setHiddenWalkthrough(true);
            setCurrentStepIndex(1);
            setCurrentStep(null);
            setTotalSteps(1);
            document.body.classList.remove("modal-open");
            setWalkthrough(false);
        };
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                stepChange("close");
            } else if (event.key === "ArrowLeft") {
                if (currentStepIndex > 1) {
                    stepChange("back");
                }
            } else if (event.key === "ArrowRight") {
                if (currentStepIndex < totalSteps) {
                    stepChange("next");
                } else {
                    stepChange("close");
                };
            };
        };
    
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [currentStepIndex, stepChange]);    

    return (
        <div className="walkthrough modal">
            <div id="walkthrough-overlay"></div>
            <div id="walkthrough-content">
                <div className="walkthrough-header">
                    <button 
                        type="button"
                        className="walkthrough-close" 
                        onClick={() => stepChange("close")}
                        title="Close Walkthrough"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <h2 className="walkthrough-title">{currentStep && currentStep.title}</h2>
                </div>
                <div className="walkthrough-body">
                    <div className="walkthrough-instruction">
                        <p>{currentStep && currentStep.instruction}</p>
                    </div>
                    {currentStep?.assets?.length > 0 && (
                        <div className="walkthrough-assets">
                            {currentStep.assets.map((asset, index) => {
                                const assetType = mediaTypes.get(asset.split(".").pop());
                                return (
                                    <>
                                        {assetType === "img" && (
                                            <img className="walkthrough-asset" src={asset} alt={`Step ${currentStep?.title} asset ${index}`} />
                                        )}
                                        {assetType === "video" && (
                                            <video className="walkthrough-asset" controls>
                                                <source src={asset} type={`video/${asset.split(".").pop()}`} />
                                            </video>
                                        )}
                                    </>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="walkthrough-footer">
                    {currentStepIndex > 1 &&
                        <button
                            type="button"
                            className="walkthrough-back"
                            onClick={() => stepChange("back")}
                            title="Last Step"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                    }
                    <span className="walkthrough-index">{currentStepIndex} of {totalSteps}</span>
                    
                    {currentStepIndex < totalSteps && 
                        <button
                            type="button"
                            className="walkthrough-next"
                            onClick={() => stepChange("next")}
                            title="Next Step"
                        >
                            <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                    }
                </div>
            </div>
        </div>
    );
};