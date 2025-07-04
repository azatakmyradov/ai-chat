import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            fill="#000000"
            width="800px"
            height="800px"
            viewBox="0 0 36 36"
            version="1.1"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
        >
            <title>chat-bubble-line</title>
            <path
                d="M18,2.5c-8.82,0-16,6.28-16,14s7.18,14,16,14a18,18,0,0,0,4.88-.68l5.53,3.52a1,1,0,0,0,1.54-.84l0-6.73a13,13,0,0,0,4-9.27C34,8.78,26.82,2.5,18,2.5ZM28.29,24.61a1,1,0,0,0-.32.73l0,5.34-4.38-2.79a1,1,0,0,0-.83-.11A16,16,0,0,1,18,28.5c-7.72,0-14-5.38-14-12s6.28-12,14-12,14,5.38,14,12A11.08,11.08,0,0,1,28.29,24.61Z"
                className="clr-i-outline clr-i-outline-path-1"
            ></path>
            <path d="M25,15.5H11a1,1,0,0,0,0,2H25a1,1,0,0,0,0-2Z" className="clr-i-outline clr-i-outline-path-2"></path>
            <path d="M21.75,20.5h-7.5a1,1,0,0,0,0,2h7.5a1,1,0,0,0,0-2Z" className="clr-i-outline clr-i-outline-path-3"></path>
            <path d="M11.28,12.5H24.72a1,1,0,0,0,0-2H11.28a1,1,0,0,0,0,2Z" className="clr-i-outline clr-i-outline-path-4"></path>
            <rect x="0" y="0" width="36" height="36" fillOpacity="0" />
        </svg>
    );
}
