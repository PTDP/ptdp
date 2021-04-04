import * as React from "react";

declare module "react-range" {
    export class Range extends React.Component<any, any> {
        new (props: any, context?: any)
    }
}