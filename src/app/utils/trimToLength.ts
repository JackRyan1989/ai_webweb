const trimToLength = (content: string, max = 20) => {
    return content.split(" ").filter((_, index) => index <= max).join(" ")
}

export default trimToLength;
