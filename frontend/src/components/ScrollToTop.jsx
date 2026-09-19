import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // We use setTimeout() to push the scroll action to the very end
        // of the call stack, ensuring the new DOM is fully rendered first.
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant'
            });
        }, 0);
    }, [pathname]);

    return null;
};

export default ScrollToTop;