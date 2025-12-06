import { useState } from "react";
import ConfigConfigurator from "./clash/configurator";

const configurator = new ConfigConfigurator();

export default function App() {
    const [providers, setProviders] = useState<ProxyProvider[]>([]);

    return <>

        <pre>
            <code>{configurator.content}</code>
        </pre>
    </>
}