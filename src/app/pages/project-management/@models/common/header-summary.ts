export class HeaderSummary {
    public header: string;
    public count: number;
    public parts: HeaderSummaryPart[];
    public colorArray:any[];
}

export class HeaderSummaryPart {
    public displayText: string;
    public displayValue: string;
}


//Constants to pick css class based on the color
export const ColorSummaryConstants =
{
    'green': 'part-green',
    'blue': 'part-blue',
    'yellow': 'part-yellow',
    'darkblue': 'part-darkblue',
    'lightblue': 'part-lightblue',
    'teal': 'part-teal',
    'orange': 'part-orange',
    'red': 'part-red',
    'lightyellow': 'part-lightyellow',
    'lightgreen':'part-lightgreen',
    'skyblue':'part-skyblue'
}
