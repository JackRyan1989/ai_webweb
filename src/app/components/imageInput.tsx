
export default function ImageInput({ changeHandler }: {
    [key: string]: (event: React.BaseSyntheticEvent) => void;
},) {
    return (
        <>
            <label htmlFor="imageInput">Upload image</label>
            <input
                accept=".gif, .jpg, .jpeg, .jxl, .webp, .png, .svg, .tiff"
                className="p-2 border-2 border-white"
                name="image-input"
                id="imageInput"
                type="file"
                onChange={changeHandler}
            />
        </>
    )
}
