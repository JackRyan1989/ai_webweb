const convertImageToBase64 = async (event: React.BaseSyntheticEvent): Promise<{ok: boolean, message: string | ArrayBuffer | null}> => {
    const file = event.target.files[0];
    const reader = new FileReader();

    try {
        reader.readAsDataURL(file);
        const convertedImage: {ok: boolean, message:  string | ArrayBuffer | null} = await new Promise((resolve, reject) => {
            reader.addEventListener("load", () => {
                resolve({ ok: true, message: reader.result });
            });

            reader.addEventListener("error", () => {
                reject({ ok: false, message: "Failure to convert image." });
            });
        });
        return convertedImage;
    } catch {
        return { ok: false, message: "Failure to convert image." }
    }
};

export default convertImageToBase64;
