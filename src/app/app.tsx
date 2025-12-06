import baseConfig from "./baseConfig.yaml"

export default function App() {
    console.log(baseConfig)
    return <>
        <pre>
            <code>{JSON.stringify(baseConfig, null, 2)}</code>
        </pre>
    </>
}