const middleware = (dispatch) => {
    return (action) => {
        // do sth
        dispatch(action);
    };
};