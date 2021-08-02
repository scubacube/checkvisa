import React from 'react';
import FormikApp from "./App";

class AppContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: 'initial',
            isLoading: false
        }
    }
    isFetching = (data) => {
        this.setState({
            isLoading: data
        })
    }
    getResult = (data) => {
        this.setState({
            status: data
        })
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.status !== this.state.status) {
            this.setState({
                status: this.state.status
            });
        }
    }
    render() {
        return <FormikApp props={this.state}
                          getres={this.getResult}
                          isFetching={this.isFetching}/>
    }
}

export default AppContainer;
