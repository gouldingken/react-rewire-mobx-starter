//https://medium.com/@BrodaNoel/conditional-rendering-in-react-and-jsx-the-solution-7c80beba1e36
//the If control provides a neater syntax than conditionals in curly brackets and also allows multiple child nodes to be specified
//TODO currently this acts differently to {} syntax because the properties of children seem to be getting calculated
//this is an issue if e.g. the conditional is a null check and the children reference that property
const If = (props) => {
    return (
        !!props.true && props.children
    );
};

export default If;