import React, {FC, ReactNode} from "react";
import "./CommonBreadcrumb.css";
import arrowIcon from "./images/breadcrumb-arrow.svg";

interface CommonBreadcrumbProps {
    children: ReactNode[];
}

interface CommonBreadcrumbPropsSubComponent {
    Section: FC<SectionProps>;
    RightContent: FC<RightContentProps>;
}

interface SectionProps {
    children: string;
    onClick?: () => void;
}

interface RightContentProps{
    children:ReactNode;
}

const CommonBreadcrumb: FC<CommonBreadcrumbProps> &
CommonBreadcrumbPropsSubComponent = ({children}) => {
        const childArray = React.Children.toArray(children);

        const buttonChildren = childArray.find(
          (child) => (child as any)?.type === RightContent
        );
      
        const breadcrumbSections = childArray.filter(
          (child) => (child as any)?.type !== RightContent
        );
      
        
    return (
        <div className="common-breadcrumb">
            <div className="breadcrumb-section-children">
                {breadcrumbSections.map((singleSection, index) => {

                    if (index + 1 !== breadcrumbSections.length) {
                        return (
                            <React.Fragment key={index}>
                                {singleSection}
                                <img src={arrowIcon} alt="breadcrumb-arrow"/>
                            </React.Fragment>
                        );
                    } else {
                        return (
                            <span key={index} className="last-section">
                                 {singleSection}
                            </span>
                        );
                    }

                })}
            </div>

            <div className="right-content">
                {buttonChildren && (buttonChildren as any).props.children}
            </div>
        </div>
    );
};

const Section: FC<SectionProps> = ({children, onClick}) => {
    const cssClasses = `section ${onClick ? "clickable-section" : ""}`;

    return (
        <span
            className={cssClasses}
            onClick={onClick ? onClick : () => {
            }}
            onKeyDown={onClick ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick();
                }
            } : undefined}
        >
            {children}
        </span>
    );
};

const RightContent: FC<RightContentProps> = ({children}) => {

    return (
        <span>
            {children}
        </span>
    );
};

CommonBreadcrumb.Section = Section;
CommonBreadcrumb.RightContent = RightContent;

export default CommonBreadcrumb;
