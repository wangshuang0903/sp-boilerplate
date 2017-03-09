import React from 'react';

class LazilyLoad extends React.Component {

    constructor() {
        super(...arguments);
        this.state = {
            isLoaded: false,
        };
    }

    componentDidMount() {
        this._isMounted = true;
        this.load();
    }

    componentDidUpdate(previous) {
        if (this.props.modules === previous.modules) return null;
        this.load();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    load() {
        this.setState({
            isLoaded: false,
        });

        const { modules } = this.props;
        const keys = Object.keys(modules);

        Promise.all(keys.map((key) => modules[key]()))
            .then((values) => (keys.reduce((agg, key, index) => {
                agg[key] = values[index];
                return agg;
            }, {})))
            .then((result) => {
                if (!this._isMounted) return null;
                this.setState({ modules: result, isLoaded: true });
            });
    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     // console.log('LazilyLoad: shouldComponentUpdate', nextProps, nextState)
    //     if( !nextState.isLoaded ) return true
    //     return true
    //     // alert(JSON.stringify(nextState))
    // }

    render() {
        if (!this.state.isLoaded) return null;
        return React.Children.only(this.props.children(this.state.modules));
    }
}

LazilyLoad.propTypes = {
    children: React.PropTypes.func.isRequired,
};

export const LazilyLoadFactory = (Component, modules) => {
    return (props) => (
        <LazilyLoad modules={modules}>
            {(mods) => <Component {...mods} {...props} />}
        </LazilyLoad>
    );
};

export const importLazy = (promise) => (
    promise.then((result) => result.default)
);

export default LazilyLoad;