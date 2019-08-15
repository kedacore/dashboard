export class NavigationLinkModel {
    text: string;
    link: string;
    sublinks?: NavigationLinkModel[];

    constructor(text: string, link: string, sublinks?: NavigationLinkModel[]) {
        this.text = text;
        this.link = link;
        this.sublinks = sublinks;
    }
}