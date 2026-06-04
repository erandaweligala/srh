import {FC} from "react";
import {Skeleton} from "antd";

type LazyLoadingSkeletonProps = object
const LazyLoadingSkeleton: FC<LazyLoadingSkeletonProps> = () => {
    return <Skeleton  className="pa-5" paragraph={{rows: 10}}/>
}

export default LazyLoadingSkeleton;