import { MosMessage } from '../MosMessage.js'

export function getXMLString(msg: MosMessage): string {
	// <mos>
	//   <ncsID/>
	//   <mosID/>
	//   <messageID>0</messageID>
	//   <heartbeat>
	//     <time>2023-01-06T08:50:45,614</time>
	//   </heartbeat>
	// </mos>
	return (
		msg
			.toString()
			.replace(/<mos>/, '')
			.replace(/<ncsID\/>/, '')
			.replace(/<mosID\/>/, '')
			.replace(/<messageID.+\n/, '')
			.replace(/<\/mos>/, '')
			.replace(/\t/g, ' ')
			.replace(/\n\s+/g, '\n')
			// .replace(/  /g, ' ')
			.trim()
	)
}
