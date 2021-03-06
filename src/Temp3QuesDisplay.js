import React, { Component } from "react";
import axios from "axios";
import { withStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import Radio from "@material-ui/core/Radio";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

const styles = {
    title: {
        color: "#3f51b5"
    },
    root: {
        width: "80%",
        margin: "30px auto",
        overflowX: "auto"
    },
    table: {
        minWidth: 700
    },
    btn: {
        width: "80px"
    }
};

let id = 0;
function createData(name) {
    id += 1;
    return { id, name };
}

class QuestionDisplay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            survey: [],
            answers: [],
            checked: [],
            questions: [],
            title: []
        };
    }

    handleSubmit = () => {
        const { answers, questions } = this.state;
        if (answers.length !== questions.length) {
            alert("Please Submit All Answers");
        } else {
            const title = [...this.state.title];
            const ans = [...this.state.answers];
            const finalAns = ans.map(a => title[a]);
            axios
                .post(
                    `https://review-app-29389812321.herokuapp.com/survey/${
                        this.props.match.params.recid
                    }/${this.props.match.params.surid}`,
                    {
                        answers: finalAns
                    }
                )
                .then(res => res.data)
                .then(data => {
                    if (data.message === "Updated") {
                        this.props.history.push("/success");
                    } else {
                        this.props.history.push("/failed");
                    }
                });
        }
    };

    handleChange = e => {
        const answers = [...this.state.answers];
        const address = e.target.name.toString().split("");
        answers[Number(address[0]) - 1] = e.target.value;
        const checked = [...this.state.checked];
        checked[Number(address[0]) - 1] = this.state.checked[
            Number(address[0]) - 1
        ].map(c => {
            if (c) {
                c = false;
            }
            return c;
        });
        checked[Number(address[0]) - 1][Number(address[1]) - 1] = true;
        this.setState({
            answers: answers,
            checked: checked
        });
    };

    componentDidMount() {
        axios
            .get(
                `https://review-app-29389812321.herokuapp.com/survey/${
                    this.props.match.params.recid
                }/${this.props.match.params.surid}`
            )
            .then(res => res.data)
            .then(data => {
                if (Number(data.template) !== 3) {
                    const link = this.props.match.url.replace(
                        "questions-temp3",
                        "questions-temp" + data.template
                    );
                    this.props.history.push(link);
                } else {
                    if (!data.message) {
                        const title = data.colTitle
                            .split(",")
                            .map(e => e.trim());
                        this.setState({ title: title }, () => {
                            this.setState({ survey: data }, () => {
                                const rows = [...this.state.questions];
                                data.questions.map(q => {
                                    rows.push(createData(q));
                                    this.setState({ questions: rows }, () => {
                                        const check = [];
                                        this.state.questions.map(q => {
                                            const a = [
                                                false,
                                                false,
                                                false,
                                                false
                                            ];
                                            check.push(a);
                                            return 5;
                                        });
                                        this.setState({ checked: check });
                                    });
                                    return true;
                                });
                            });
                        });
                    } else if (data.message === "404 Not Found") {
                        this.props.history.push("/420");
                    } else if (data.message === "Response Submitted") {
                        this.props.history.push("/submitted");
                    }
                }
            });
    }
    render() {
        const display = this.state.questions.map((q, i) => (
            <TableRow key={q.id}>
                <TableCell component="th" scope="row">
                    {q.name}
                </TableCell>
                {this.state.title.map((t, j) => {
                    return (
                        <TableCell key={j * 100} align="center">
                            <Radio
                                checked={
                                    this.state.checked[i]
                                        ? this.state.checked[i][j]
                                        : false
                                }
                                onChange={this.handleChange}
                                value={j}
                                name={`${q.id}${j + 1}`}
                                aria-label="A"
                            />
                        </TableCell>
                    );
                })}
            </TableRow>
        ));
        const { classes } = this.props;
        const { title } = this.state.survey;
        const row = this.state.title.map((t, a) => {
            return (
                <TableCell key={a} align="center">
                    {t}
                </TableCell>
            );
        });
        return (
            <div>
                <h1 className={classes.title}>{`Survey on ${title}`}</h1>
                <Paper className={classes.root}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Questions</TableCell>
                                {row}
                            </TableRow>
                        </TableHead>
                        <TableBody>{display}</TableBody>
                    </Table>
                </Paper>
                <Button
                    variant="contained"
                    color="primary"
                    className={classes.btn}
                    onClick={this.handleSubmit}
                >
                    Submit
                </Button>
            </div>
        );
    }
}

export default withStyles(styles)(QuestionDisplay);
