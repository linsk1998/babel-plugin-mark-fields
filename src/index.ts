import { declare } from "@babel/helper-plugin-utils";

export = declare(function (api) {
	api.assertVersion(7);
	const t = api.types;

	interface FieldInfo {
		keyNode: any;
		computed: boolean;
	}

	/** 收集非 static 的 class property，返回 key 表达式和 computed 标记 */
	function collectFields(body: any): FieldInfo[] {
		const fields: FieldInfo[] = [];
		for (const member of body.body) {
			// ClassProperty: 普通字段
			if (!t.isClassProperty(member)) continue;
			if (member.static) continue;

			if (member.computed) {
				// [expr] → prototype[expr]
				fields.push({ keyNode: member.key, computed: true });
			} else if (t.isIdentifier(member.key)) {
				fields.push({ keyNode: member.key, computed: false });
			} else if (t.isStringLiteral(member.key)) {
				fields.push({ keyNode: member.key, computed: true });
			} else if (t.isNumericLiteral(member.key)) {
				fields.push({ keyNode: member.key, computed: true });
			}
		}
		return fields;
	}

	function createStaticBlock(fields: FieldInfo[]) {
		const statements = fields.map((f) => {
			// this.prototype[key] = undefined
			return t.expressionStatement(
				t.assignmentExpression(
					"=",
					t.memberExpression(
						t.memberExpression(
							t.thisExpression(),
							t.identifier("prototype"),
						),
						f.keyNode,
						f.computed,
					),
					t.identifier("undefined"),
				),
			);
		});

		return t.staticBlock(statements);
	}

	return {
		name: "mark-fields",
		visitor: {
			Class(path) {
				const classNode = path.node;
				const fields = collectFields(classNode.body);
				if (fields.length === 0) return;

				const staticBlock = createStaticBlock(fields);

				// 把 static {} 插到 class body 最前面
				classNode.body.body.unshift(staticBlock);
			},
		},
	};
});
